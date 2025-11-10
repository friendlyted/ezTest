export type ConditionType = boolean | Promise<boolean> | (()=>ConditionType);

export interface ModuleOutput extends TestOutput {
    module(): void;

    total(): void;
}

export interface TestOutput {
    execute(fnName: string): void;

    ok(fnName: string): void;

    fail(fnName: string, err: any): void;
}

export type Module = {
    default?: unknown;
    [key: string]: any;
}

export type ModulePromise = Promise<Module>;

export type TestSuiteOptions = {
    output?: (moduleName: string) => ModuleOutput,
    executor?: TestExecutor,
    parallel?: boolean
}

export type TestModuleOptions = {
    output?: TestOutput,
    executor?: TestExecutor,
    parallel?: boolean
}

export interface TestExecutor {
    (fnName: string, fnPtr: any, summary: TestOutput, before?: BeforeTest, after?: AfterTest): Promise<void>;
}

export interface BeforeAllTests {
    (): void | Promise<void>;
}

export interface AfterAllTests {
    (): void | Promise<void>;
}

export interface BeforeTest {
    (name: string, fnPtr: any): void | Promise<void>;
}

export interface AfterTest {
    (name: string, fnPtr: any): void | Promise<void>;
}