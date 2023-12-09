export class Benchmarker {
    static benchmarks: Record<string, number[]>;
    static start(mark: string): () => void;
    static print(): void;
}
