var os = require('os');
var fs = require('fs');
var plist = require('simple-plist');

const safariBookmarksFile = os.homedir() + '/Library/Safari/Bookmarks.plist';
const chromeBookmarksFile = os.homedir() + '/Library/Application Support/Google/Chrome/Default/Bookmarks';


function readChromeBookmarks(bookmarks) {
  var syncBookmarks = [];

  bookmarks.forEach(function(item) {
    switch (item.type) {
      case 'url':
        syncBookmarks.push({
          URIDictionary: {
            title: item.name
          },
          URLString: item.url,
          WebBookmarkType: "WebBookmarkTypeLeaf"
        });
        break;

      case 'folder':
        syncBookmarks.push({
          Title: item.name,
          WebBookmarkType: "WebBookmarkTypeList",
          Children: readChromeBookmarks(item.children)
        });
        break;
    }
  });

  return syncBookmarks;
}


var chromeData = JSON.parse(fs.readFileSync(chromeBookmarksFile));
var safariData = plist.readFileSync(safariBookmarksFile);

console.log(safariData.Children[1].Children);

safariData.Children[1].Children = readChromeBookmarks(chromeData.roots.bookmark_bar.children);

plist.writeBinaryFileSync(safariBookmarksFile, safariData);
