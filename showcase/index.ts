import {ConsoleSummary, ImportantConsoleSummary, TestSuite} from "../Test.ts";

export async function main() {
    const testSuite = new TestSuite({
        output: m => new ImportantConsoleSummary(m),
        parallel: false
    })
        .addModule("testable", import("./testable.ts"))
        .execute()
}