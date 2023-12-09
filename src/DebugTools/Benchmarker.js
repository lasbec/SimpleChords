export class Benchmarker {
  /** @type {Record<string, number[]>} */
  static benchmarks = {};
  /** @param {string} mark */
  static start(mark) {
    const start = new Date();
    return () => {
      const end = new Date();
      let collector = Benchmarker.benchmarks[mark];
      if (!collector) {
        collector = [];
        Benchmarker.benchmarks[mark] = collector;
      }
      collector.push(end.valueOf() - start.valueOf());
    };
  }

  static print() {
    for (const [key, value] of Object.entries(Benchmarker.benchmarks)) {
      const totalSeconds = value.reduce((a, b) => a + b, 0) / 1000;
      const avgSeconds = totalSeconds / value.length;
      value.sort();
      const medianSeconds = value[Math.ceil(value.length / 2)] / 1000;
      console.error(`\n${key}
  avg: ${avgSeconds}s
  total: ${totalSeconds}s
  median: ${medianSeconds}s
  count: ${value.length}`);
    }
  }
}
