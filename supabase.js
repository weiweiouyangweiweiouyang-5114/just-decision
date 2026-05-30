var sb = supabase.createClient(supabaseUrl, supabaseKey);
var currentUser = null;
var onUserChange = null;

sb.auth.onAuthStateChange(function (event, session) {
  currentUser = session ? session.user : null;
  if (onUserChange) onUserChange(currentUser);
});

function signUp(email, password) {
  return sb.auth.signUp({ email: email, password: password });
}

function logIn(email, password) {
  return sb.auth.signInWithPassword({ email: email, password: password });
}

function logOut() {
  return sb.auth.signOut();
}

function saveToCloud(records) {
  if (!currentUser) return Promise.resolve();
  return sb.from("user_data").upsert({
    user_id: currentUser.id,
    records: records,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id" });
}

function loadFromCloud() {
  if (!currentUser) return Promise.resolve(null);
  return sb.from("user_data").select("records").eq("user_id", currentUser.id).single().then(function (res) {
    if (res.data) return res.data.records || [];
    return [];
  }).catch(function () {
    return [];
  });
}
