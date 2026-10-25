import urllib.request, urllib.error, urllib.parse, uuid, sys
base=sys.argv[1].rstrip('/')
note='securitycheck-'+uuid.uuid4().hex
text='PHP security upgrade 验证 <tag> & persistence'
def request(path,data=None):
    try:
        with urllib.request.urlopen(urllib.request.Request(base+path,data=data,headers={'User-Agent':'SecurityUpgradeCheck/1.0'}),timeout=20) as r:return r.status,r.read()
    except urllib.error.HTTPError as e:return e.code,e.read()
def post(path,text):return request(path,urllib.parse.urlencode({'text':text}).encode())
try:
    assert post('/'+note,text)[0]==200
    assert request('/index.php?note='+note+'&raw=1')[1].decode()==text
    page=request('/'+note)[1].decode()
    assert '&lt;tag&gt;' in page
    assert request('/index.php?note[]=x')[0]==200
    assert request('/'+note,b'text[]=x')[0]==400
    assert post('/'+note,'x'*102401)[0]==403
    assert request('/_tmp/'+note)[0]==403
    assert request('/styles.css')[0]==200
    assert request('/js/marked.min.js')[0]==200
    print('PASS save/read/HTML escaping/array inputs/size limit/private storage/static assets',base)
finally:
    assert post('/'+note,'')[0]==200
    assert request('/index.php?note='+note+'&raw=1')[0]==404
    print('PASS delete and cleanup')
