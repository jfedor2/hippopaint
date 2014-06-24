# vim: set fileencoding=utf-8 expandtab shiftwidth=4 tabstop=4 softtabstop=4:

import os
os.environ['DJANGO_SETTINGS_MODULE'] = 'settings'

from google.appengine.dist import use_library
use_library('django', '1.2')

from google.appengine.ext import webapp
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.api import urlfetch
from google.appengine.ext.webapp import template
import os
import logging
import traceback

class FrontPage(webapp.RequestHandler):
    def get(self):
        self.response.out.write(template.render(os.path.join(os.path.dirname(__file__), 'static', 'index.html'), {}))

class Proxy(webapp.RequestHandler):
    def get(self):
        try:
            rnd_from_request = self.request.get('rnd')
            rnd_from_cookie = self.request.cookies.get('rnd', '')
            if not rnd_from_request or rnd_from_request != rnd_from_cookie:
                raise Exception('rnd mismatch')
            url = self.request.get('url')
            if not url:
                raise Exception('no url')
            result = urlfetch.fetch(url)
            if not (result.headers.get('Content-Type') in ['image/jpeg', 'image/gif', 'image/png']):
                raise Exception('mimetype not on the whitelist')
            self.response.headers['Content-Type'] = result.headers.get('Content-Type')
            self.response.out.write(result.content)
        except:
            logging.debug(traceback.format_exc())
            self.error(403)

application = webapp.WSGIApplication([
    ('/', FrontPage),
    ('/proxy', Proxy)],
    debug=True)

def main():
    run_wsgi_app(application)

if __name__ == "__main__":
    main()
