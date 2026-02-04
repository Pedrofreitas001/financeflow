// utils/userDataState.ts
// Simple local flag for "user has real data"

const KEY = 'has_user_data';
const SOURCE_KEY = 'data_source';
const EVENT_NAME = 'user-data-changed';

export function getHasUserData(): boolean {
    return localStorage.getItem(KEY) === '1';
}

export type DataSourceBadge = 'example' | 'google_sheets' | 'backup' | 'manual';

export function getDataSource(): DataSourceBadge | null {
    const value = localStorage.getItem(SOURCE_KEY);
    if (!value) return null;
    return value as DataSourceBadge;
}

export function markDataSource(source: DataSourceBadge) {
    localStorage.setItem(SOURCE_KEY, source);
    window.dispatchEvent(new Event(EVENT_NAME));
}

export function markUserDataLoaded() {
    localStorage.setItem(KEY, '1');
    window.dispatchEvent(new Event(EVENT_NAME));
}

export function markUsingExampleData() {
    localStorage.setItem(KEY, '0');
    localStorage.setItem(SOURCE_KEY, 'example');
    window.dispatchEvent(new Event(EVENT_NAME));
}

export function onUserDataChange(handler: () => void) {
    const listener = () => handler();
    window.addEventListener(EVENT_NAME, listener);
    return () => window.removeEventListener(EVENT_NAME, listener);
}
