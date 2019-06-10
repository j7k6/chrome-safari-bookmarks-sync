var os = require('os');
var fs = require('fs');
var plist = require('simple-plist');
var http = require('http');

const listenPort = 50005;
const safariBookmarksFile = os.homedir() + '/Library/Safari/Bookmarks.plist';
const chromeBookmarksFile = os.homedir() + '/Library/Application Support/Google/Chrome/Default/Bookmarks';


function convertChromeBookmarks(bookmarks) {
  var safariBookmarks = [];

  bookmarks.forEach(function(item) {
    if ('children' in item) {
      safariBookmarks.push({
        Title: item.title,
        WebBookmarkType: "WebBookmarkTypeList",
        Children: convertChromeBookmarks(item.children)
      });
    } else {
      safariBookmarks.push({
        URIDictionary: {
          title: item.title
        },
        URLString: item.url,
        WebBookmarkType: "WebBookmarkTypeLeaf"
      });
    }
  });

  return safariBookmarks;
}


function syncBookmarks(bookmarks) {
  var safariData = plist.readFileSync(safariBookmarksFile);
  var safariBookmarks = convertChromeBookmarks(bookmarks);

  safariData.Children[1].Children = safariBookmarks;

  try {
    plist.writeBinaryFileSync(safariBookmarksFile, safariData);
    console.log(`OK: Bookmarks Synced!`);
  } catch (err) {
    console.log(`ERROR: Safari Bookmarks.plist could not be written! (${err})`);
  }
}


http.createServer(function (req, res) {
  if (req.method === 'POST') {
    if (req.url === '/sync') {
      var chunks = [];

      req.on('data', function(data) {
        chunks.push(data);
      });

      req.on('end', function() {
        var data = JSON.parse(Buffer.concat(chunks));

        syncBookmarks(data);
        res.writeHead(200);
        res.end();
      });

      return;
    }
  }

  res.writeHead(405);
  res.end(`${req.method} not allowd!`);

}).listen(50005);
console.log(`Listening on port ${listenPort}...`);
