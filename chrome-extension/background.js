'use strict';


function syncBookmarks() {
  chrome.bookmarks.getTree(function(tree) {
    var bookmarks = tree[0].children[0].children;
    var req = new XMLHttpRequest();

    req.open('POST', 'http://127.0.0.1:50005/sync', true);
    req.setRequestHeader('Content-Type', 'application/json');

    req.onreadystatechange = function() {
      if (req.status === 200) {
        console.log("OK: Bookmarks Synced!");
      } else {
        console.log("ERROR: Bookmarks Sync failed!");
      }
    };

    req.send(JSON.stringify(bookmarks));
  });
}
 

chrome.bookmarks.onCreated.addListener(function() {
  syncBookmarks();
});

chrome.bookmarks.onRemoved.addListener(function() {
  syncBookmarks();
});

chrome.bookmarks.onChanged.addListener(function() {
  syncBookmarks();
});

chrome.bookmarks.onMoved.addListener(function() {
  syncBookmarks();
});

chrome.bookmarks.onChildrenReordered.addListener(function() {
  syncBookmarks();
});

chrome.bookmarks.onImportEnded.addListener(function() {
  syncBookmarks();
});
