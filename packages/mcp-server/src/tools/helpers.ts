import { SwatBloc } from "@swatbloc/sdk";

export function getSdkClient(args: { api_key?: string; base_url?: string }) {
    const apiKey = args.api_key || process.env.SWATBLOC_API_KEY;
    const baseUrl = args.base_url || process.env.SWATBLOC_BASE_URL;

    if (!apiKey) {
        throw new Error("Missing API key. Provide api_key in tool input or set SWATBLOC_API_KEY.");
    }

    return new SwatBloc(apiKey, baseUrl ? { baseUrl } : {});
}

/**
 * Generate Cartesian product from options
 */
export function generateCartesianProduct(options: Array<{ name: string; values: string[] }>): Record<string, string>[] {
    if (options.length === 0) return [{}];
    const result: Record<string, string>[] = [];

    function recurse(index: number, current: Record<string, string>) {
        if (index === options.length) {
            result.push({ ...current });
            return;
        }
        const option = options[index];
        for (const value of option.values) {
            current[option.name] = value;
            recurse(index + 1, current);
        }
    }

    recurse(0, {});
    return result;
}
