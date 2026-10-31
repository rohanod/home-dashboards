"""Check server.now_playing against replies captured from a real Sonos (Spotify track, paused).
Run: python3 -B tests/test_sonos_parse.py
"""
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import server  # noqa: E402

ENV = ('<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body>'
       '{}</s:Body></s:Envelope>')
TRANSPORT = ENV.format(
    '<u:GetTransportInfoResponse xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">'
    '<CurrentTransportState>PAUSED_PLAYBACK</CurrentTransportState></u:GetTransportInfoResponse>')
DIDL = ('&lt;DIDL-Lite xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; '
        'xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot; '
        'xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot;&gt;&lt;item id=&quot;-1&quot;&gt;'
        '&lt;upnp:albumArtURI&gt;{art}&lt;/upnp:albumArtURI&gt;&lt;dc:title&gt;Rescue&lt;/dc:title&gt;'
        '&lt;dc:creator&gt;Lauren Daigle&lt;/dc:creator&gt;&lt;upnp:album&gt;Look Up Child&lt;/upnp:album&gt;'
        '&lt;/item&gt;&lt;/DIDL-Lite&gt;')


def position(art, meta=None):
    return ENV.format(
        '<u:GetPositionInfoResponse xmlns:u="urn:schemas-upnp-org:service:AVTransport:1">'
        f'<TrackDuration>0:03:35</TrackDuration><TrackMetaData>{meta or DIDL.format(art=art)}</TrackMetaData>'
        '<RelTime>0:02:14</RelTime></u:GetPositionInfoResponse>')


def run(pos_xml):
    replies = {'GetTransportInfo': TRANSPORT, 'GetPositionInfo': pos_xml}
    server.soap = lambda host, action, **args: ET.fromstring(replies[action])
    return server.now_playing('10.0.0.5')


d = run(position('https://i.scdn.co/image/abc'))
art = d.pop('art')
assert d == {'state': 'PAUSED_PLAYBACK', 'title': 'Rescue', 'artist': 'Lauren Daigle',
             'album': 'Look Up Child', 'duration': 215, 'position': 134}, d
# Artwork is served same-origin; the upstream URL stays server-side.
assert art.startswith('/api/art?host=10.0.0.5&t=') and server.ART['10.0.0.5'] == 'https://i.scdn.co/image/abc'

# Local art paths are made absolute against the speaker; non-http schemes are dropped.
run(position('/getaa?s=1&amp;amp;u=x'))
assert server.ART['10.0.0.5'] == 'http://10.0.0.5:1400/getaa?s=1&u=x'
server.ART.clear()
assert run(position('file:///etc/passwd'))['art'] == '' and not server.ART
d = run(position('', meta='NOT_IMPLEMENTED').replace('0:03:35', ''))
assert d['title'] == '' and d['duration'] == 0, d

# Controls: SOAP action names and arguments, seek time formatting.
calls = []
server.soap = lambda host, action, **args: calls.append((action, args))
server.control('h', 'play')
server.control('h', 'pause')
server.control('h', 'next')
server.control('h', 'previous')
server.control('h', 'seek', 3725)
assert calls == [('Play', {'Speed': 1}), ('Pause', {}), ('Next', {}), ('Previous', {}),
                 ('Seek', {'Unit': 'REL_TIME', 'Target': '1:02:05'})], calls
print('ok')
