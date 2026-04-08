import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjmXMMafuPYkYi1GzrnucNJSjxypN2gYQ",
  authDomain: "docky-dev-fr.firebaseapp.com",
  projectId: "docky-dev-fr",
  storageBucket: "docky-dev-fr.firebasestorage.app",
  messagingSenderId: "548202839817",
  appId: "1:548202839817:web:832f713ae5135e41809dd8",
  measurementId: "G-KLXHVFYQYY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateChangelog() {
  const docRef = doc(db, "update-p", "main");
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const changelog = data.changelog || [];

    // v3.0.3 (special version) - Dec 20
    const newYearStart = {
      id: "special_new_year_start",
      version: "v3.0.3 (special version)",
      date: "2025-12-20",
      changes: ["Golden New Year theme activated on the site"]
    };

    // v3.0.3 - Jan 02
    const newYearEnd = {
      id: "special_new_year_end",
      version: "v3.0.3",
      date: "2026-01-02",
      changes: [
        "Bug fix",
        "Feature addition",
        "New Year theme removed"
      ]
    };

    const updatedChangelog = [newYearEnd, newYearStart, ...changelog];

    await setDoc(docRef, {
      ...data,
      changelog: updatedChangelog,
      next_update_date: "2025-12-20T00:00:00",
      no_update_planned: false,
      updated_at: new Date().toISOString()
    });

    console.log("Changelog updated successfully with special versions.");
  } else {
    console.log("Document not found.");
  }
}

updateChangelog().catch(console.error);
