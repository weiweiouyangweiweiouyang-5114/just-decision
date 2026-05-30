var db = null;
var currentUser = null;
var onUserChange = null;
var firebaseReady = false;

(function () {
  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    db.settings({ merge: true });
    firebase.auth().onAuthStateChanged(function (user) {
      currentUser = user;
      firebaseReady = true;
      if (onUserChange) onUserChange(user);
    });
    console.log("Firebase initialized OK");
  } catch (e) {
    console.error("Firebase init error:", e.message);
  }
})();

function signUp(email, password) {
  return firebase.auth().createUserWithEmailAndPassword(email, password);
}

function logIn(email, password) {
  return firebase.auth().signInWithEmailAndPassword(email, password);
}

function logOut() {
  return firebase.auth().signOut();
}

function getUserDoc() {
  if (!currentUser || !db) return null;
  return db.collection("users").doc(currentUser.uid);
}

function saveToCloud(records) {
  var doc = getUserDoc();
  if (!doc) return Promise.resolve();
  return doc.set({ records: records, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
}

function loadFromCloud() {
  var doc = getUserDoc();
  if (!doc) return Promise.resolve(null);
  return doc.get().then(function (snap) {
    if (snap.exists) return snap.data().records || [];
    return [];
  });
}

function deleteFromCloud(recordId) {
  // Records are stored as array, so just save the updated array
  return Promise.resolve();
}
