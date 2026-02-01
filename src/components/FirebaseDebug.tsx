import React, { useEffect, useState } from "react";
import { auth, db, firebaseConfig, validateFirebaseConfig } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { testFirebaseConnection, initializeSampleData } from "../firebase/setup";
import { getNotes } from "../firebase/notesService";

const FirebaseDebug: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsub();
  }, []);

  const handleCreateAccount = async () => {
    setMessage(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      setMessage(`Account created: ${cred.user.email}`);
    } catch (err: any) {
      setMessage(`Create account failed: ${err.message || err}`);
    }
  };

  const handleSignIn = async () => {
    setMessage(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setMessage(`Signed in: ${cred.user.email}`);
    } catch (err: any) {
      setMessage(`Sign in failed: ${err.message || err}`);
    }
  };

  const handleSignOut = async () => {
    setMessage(null);
    try {
      await signOut(auth);
      setMessage("Signed out successfully");
    } catch (err: any) {
      setMessage(`Sign out failed: ${err.message || err}`);
    }
  };

  const handleTestAuthWrite = async () => {
    setMessage(null);
    try {
      if (!currentUser) {
        setMessage("Not signed in — cannot perform authenticated write.");
        return;
      }
      const col = collection(db, "auth-tests");
      const docRef = await addDoc(col, {
        uid: currentUser.uid,
        message: "Auth test write",
        timestamp: new Date()
      });
      setMessage(`Auth write successful: ${docRef.id}`);
    } catch (err: any) {
      setMessage(`Auth write failed: ${err.message || err}`);
    }
  };

  const handleTestFirestoreConnection = async () => {
    setMessage(null);
    try {
      const ok = await testFirebaseConnection();
      setMessage(ok ? 'Firestore connection OK' : 'Firestore connection failed');
    } catch (err: any) {
      setMessage(`Firestore connection error: ${err.message || err}`);
    }
  };

  const handleAddSampleData = async () => {
    setMessage(null);
    try {
      await initializeSampleData();
      setMessage('Sample data added successfully');
    } catch (err: any) {
      setMessage(`Add sample data failed: ${err.message || err}`);
    }
  };

  const handleFetchNotes = async () => {
    setMessage(null);
    try {
      const notes = await getNotes();
      setMessage(`Fetched ${notes.length} notes. Check console for data.`);
      console.debug('[fetchNotes] notes:', notes);
    } catch (err: any) {
      setMessage(`Fetch notes failed: ${err.message || err}`);
      console.error('[fetchNotes] Error:', err);
    }
  };

  const handleShowConfig = () => {
    const { missing, valid } = validateFirebaseConfig();
    const masked = {
      apiKey: firebaseConfig.apiKey ? `****${firebaseConfig.apiKey.slice(-6)}` : '(missing)'
    };
    console.debug('[firebaseConfig]', { masked, full: { ...firebaseConfig } });
    setMessage(valid ? 'Firebase config looks complete (see console for details)' : `Missing keys: ${missing.join(', ')}`);
  };

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, marginBottom: 16 }}>
      <h3>Firebase Debug Panel</h3>
      <div style={{ marginBottom: 8 }}>
        <strong>Current user:</strong> {currentUser ? currentUser.email : "Not signed in"}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={handleCreateAccount}>Create account</button>
        <button onClick={handleSignIn}>Sign in</button>
        <button onClick={handleSignOut}>Sign out</button>
        <button onClick={handleTestAuthWrite}>Test authenticated Firestore write</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={handleTestFirestoreConnection}>Test Firestore connection</button>
        <button onClick={handleAddSampleData}>Add sample data</button>
        <button onClick={handleFetchNotes}>Fetch notes</button>
        <button onClick={handleShowConfig}>Show config</button>
      </div>

      {message && (
        <div style={{ marginTop: 8, color: "#0a66ff" }}>
          <strong>Result:</strong> {message}
        </div>
      )}
    </div>
  );
};

export default FirebaseDebug;
