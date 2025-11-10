import {ImportantConsoleOutput, TestSuite} from "../Test.ts";

export async function main() {
    const testSuite = new TestSuite({
        output: m => new ImportantConsoleOutput(m),
        parallel: false
    })
        .addModule("testable", import("./testable.ts"))
        .execute()
}