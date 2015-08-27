interface JQuery {
    typeWatch: JQueryTypewatch.Typewatch;
}

declare module JQueryTypewatch {
    interface Options {
        callback: (string) => void;

        wait: number;

        highlight?: boolean;

        captureLength?: number;
    }

    interface Typewatch {
        (options?: Options): JQuery;
    }
}
