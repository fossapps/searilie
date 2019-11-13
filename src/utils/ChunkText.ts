export const chunkText = (text: string, length: number): string[] => {
    const regexChunk = new RegExp(`.{1,${length}}`, "g");
    return text.match(regexChunk)!;
};

export class ExtractText {
    constructor(private text: string) {
    }
    public extract(length: number): string {
        const text = this.text.substr(0, length);
        this.text = this.text.substr(length);
        return text;
    }
}
