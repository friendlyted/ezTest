export type ConditionType = boolean | Promise<boolean> | (()=>ConditionType);

export async function assertThat(condition: ConditionType, message: string) {
    if (condition === null || condition === undefined) throw "Assertion requires arguments (condition, message)";

    condition = await condition;

    if(typeof condition === "function"){
        condition = await condition();
    }

    if (!condition) throw new Error("Condition was not satisfied: " + message);
}

export async function assertEquals<T>(actual: T | Promise<T>, expected: T | Promise<T>, message: string) {
    actual = await actual;
    expected = await expected;

    if (actual === expected) return;

    let actualType = typeof actual;
    let expectedType = typeof expected;

    if (actualType !== expectedType) {
        throw new Error(message + `:\nThe actual value type '${actualType}' does not match the expected type '${expectedType}'`);
    }
    if (actualType !== "object") {
        throw new Error(message + `:\nThe actual value '${actual}' does not match the expected '${expected}'`);
    }

    const actualJSON = JSON.stringify(actual, null, "\t");
    const expectedJSON = JSON.stringify(actual, null, "\t");

    if (actualJSON !== expectedJSON) {
        throw new Error(message + `:\nThe actual object does not match the expected: \nActual: '${actualJSON}' \nExpected: '${expectedJSON}'`);
    }
}