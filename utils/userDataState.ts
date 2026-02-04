// utils/userDataState.ts
// Simple local flag for "user has real data"

const KEY = 'has_user_data';
const EVENT_NAME = 'user-data-changed';

export function getHasUserData(): boolean {
    return localStorage.getItem(KEY) === '1';
}

export function markUserDataLoaded() {
    localStorage.setItem(KEY, '1');
    window.dispatchEvent(new Event(EVENT_NAME));
}

export function markUsingExampleData() {
    localStorage.setItem(KEY, '0');
    window.dispatchEvent(new Event(EVENT_NAME));
}

export function onUserDataChange(handler: () => void) {
    const listener = () => handler();
    window.addEventListener(EVENT_NAME, listener);
    return () => window.removeEventListener(EVENT_NAME, listener);
}
