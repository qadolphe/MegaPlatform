export interface StoreSettings {
    id: string;
    name: string;
    subdomain: string;
    custom_domain: string | null;
    theme: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
    };
    logo_url: string | null;
    favicon_url: string | null;
    stripe_account_id: string | null;
    stripe_details_submitted: boolean;
    currency: string;
    owner_id: string;
}

export interface Collaborator {
    id: string;
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
    email?: string;
}

export type SettingsTab = 'general' | 'domains' | 'theme' | 'billing' | 'team' | 'developer';
