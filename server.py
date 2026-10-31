#!/usr/bin/env python3
"""Static file server for the display.

    python3 server.py [--port 8080] [--bind 127.0.0.1]

Static files are always revalidated (no-cache), so a deploy shows up on the next page load.

With --ha <url> (or HA_URL), GET /api/ha?ids=a.b,c.d returns {"a.b": "<state>", ...} from Home Assistant,
and GET /api/location returns HA's home {lat, lon, name} (rounded). Responses are cached briefly.
Auth is HA's trusted_networks provider (this host must be allowed there): no token is stored.
"""
import argparse
import json
import os
import re
import ssl
import time
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HA_URL = None
CLIENT_ID = 'http://localhost/'  # any http URL; HA only checks it is consistent across the login steps
ENTITY = re.compile(r'^[a-z_]+\.[a-z0-9_]+$')
_ha = {'token': None, 'expires': 0}
_cache = {}  # path+query -> (expires, body); HA is asked at most once per TTL however many screens are open
TTL = 10
_ctx = ssl.create_default_context()
_ctx.check_hostname = False  # HA is on the LAN with a self-signed certificate
_ctx.verify_mode = ssl.CERT_NONE


def ha_call(path, body=None, form=False, token=None):
    headers = {'Authorization': f'Bearer {token}'} if token else {}
    if body is not None:
        data = urllib.parse.urlencode(body).encode() if form else json.dumps(body).encode()
        if not form:
            headers['Content-Type'] = 'application/json'
    else:
        data = None
    req = urllib.request.Request(HA_URL + path, data, headers)
    with urllib.request.urlopen(req, context=_ctx, timeout=10) as res:
        return json.load(res)


def ha_token():
    """Access token via the trusted_networks login flow, renewed shortly before it expires (30 min)."""
    if time.time() < _ha['expires']:
        return _ha['token']
    flow = ha_call('/auth/login_flow', {'client_id': CLIENT_ID, 'handler': ['trusted_networks', None], 'redirect_uri': CLIENT_ID})
    if flow.get('type') != 'create_entry':
        raise RuntimeError('trusted_networks login not offered (is this host allowed in HA?)')
    tok = ha_call('/auth/token', {'grant_type': 'authorization_code', 'code': flow['result'], 'client_id': CLIENT_ID}, form=True)
    _ha.update(token=tok['access_token'], expires=time.time() + tok['expires_in'] - 120)
    return _ha['token']


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path not in ('/api/ha', '/api/location'):
            return super().do_GET()
        ids = urllib.parse.parse_qs(url.query).get('ids', [''])[0].split(',')
        if not HA_URL or (url.path == '/api/ha' and not all(ENTITY.match(i) for i in ids)):
            return self.send_error(400)
        hit = _cache.get(self.path)
        if hit and hit[0] > time.time():
            body = hit[1]
        else:
            try:
                token = ha_token()
                if url.path == '/api/location':  # home coordinates from HA, rounded to ~1 km
                    cfg = ha_call('/api/config', token=token)
                    out = {'lat': round(cfg['latitude'], 2), 'lon': round(cfg['longitude'], 2), 'name': cfg.get('location_name')}
                else:
                    out = {i: ha_call(f'/api/states/{i}', token=token)['state'] for i in ids}
            except Exception as e:  # unreachable HA, unknown entity, auth refused
                _ha['expires'] = 0
                return self.send_error(502, str(e)[:100])
            body = json.dumps(out).encode()
            if len(_cache) > 50:
                _cache.clear()
            _cache[self.path] = (time.time() + (3600 if url.path == '/api/location' else TTL), body)
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--port', type=int, default=8080)
    ap.add_argument('--bind', default='127.0.0.1')
    ap.add_argument('--ha', default=os.environ.get('HA_URL'), help='Home Assistant base URL (default: $HA_URL)')
    args = ap.parse_args()
    HA_URL = args.ha.rstrip('/') if args.ha else None
    ThreadingHTTPServer((args.bind, args.port), Handler).serve_forever()
