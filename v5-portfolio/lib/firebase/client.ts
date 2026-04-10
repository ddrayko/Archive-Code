import { db } from "./config"

export function getFirestoreClient() {
    return db
}
