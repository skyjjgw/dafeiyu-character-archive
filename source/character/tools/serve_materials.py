"""Loopback-only project preview, with explicit ES-module MIME types on Windows."""
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import argparse

class Handler(SimpleHTTPRequestHandler):
    extensions_map={**SimpleHTTPRequestHandler.extensions_map,
                    '.js':'application/javascript','.mjs':'application/javascript',
                    '.json':'application/json','.wasm':'application/wasm'}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=4334)
    parser.add_argument('--directory',default=str(Path(__file__).resolve().parent.parent))
    args=parser.parse_args();directory=Path(args.directory).resolve()
    server=ThreadingHTTPServer(('127.0.0.1',args.port),partial(Handler,directory=str(directory)))
    print(f'Materials preview: http://127.0.0.1:{server.server_port}/',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
