interface BeforeAllTests {
    (): void | Promise<void>;
}

interface AfterAllTests {
    (): void | Promise<void>;
}

interface BeforeTest {
    (name: string, fnPtr: any): void | Promise<void>;
}

interface AfterTest {
    (name: string, fnPtr: any): void | Promise<void>;
}

interface ModuleOutput extends TestOutput {
    module(): void;

    total(): void;
}

interface TestOutput {
    execute(fnName: string): void;

    ok(fnName: string): void;

    fail(fnName: string, err: any): void;
}

type Module = {
    default?: unknown;
    [key: string]: any;
}

type ModulePromise = Promise<Module>;

type TestSuiteOptions = {
    output?: (moduleName: string) => ModuleOutput,
    executor?: TestExecutor,
    parallel?: boolean
}

type TestModuleOptions = {
    output?: TestOutput,
    executor?: TestExecutor,
    parallel?: boolean
}

interface TestExecutor {
    (fnName: string, fnPtr: any, summary: TestOutput, before?: BeforeTest, after?: AfterTest): Promise<void>;
}

export class SilentSummary implements ModuleOutput {
    public static readonly INSTANCE = new SilentSummary();

    module(): void {
    }

    total(): void {
    }

    execute(): void {
    }

    ok(): void {
    }

    fail(): void {
    }
}

export class ConsoleSummary implements ModuleOutput, TestOutput {
    protected okNumber = 0;
    protected errorNumber = 0;
    private readonly moduleName: string;

    constructor(moduleName: string) {
        this.moduleName = moduleName;
    }

    module() {
        console.debug(`#####\nExecuting module "${this.moduleName}"`);
    }

    total() {
        console.info(`#####\nModule "${this.moduleName}" results: ok: ${this.okNumber}, errors: ${this.errorNumber}`)
    }

    execute(fnName: string) {
        console.debug(`Executing test '${this.moduleName}#${fnName}'...`);
    }

    fail(fnName: string, err: any) {
        this.errorNumber++;
        console.error(`Test '${this.moduleName}#${fnName}' failed: ${err}`);
    }

    ok(fnName: string) {
        this.okNumber++;
        console.debug(`Test '${this.moduleName}#${fnName}' is OK`);
    }
}

export class ImportantConsoleSummary extends ConsoleSummary{
    module() {}
    execute(){}
    ok(){this.okNumber++}
}

export async function testModule(module: Module, options?: TestModuleOptions) {
    options = Object.assign({
        output: SilentSummary.INSTANCE,
        executor: defaultExecutor,
        parallel: true
    }, options)

    let before = module['$beforeEachTest'] as BeforeTest;
    let beforeAll = module['$beforeAllTests'] as BeforeAllTests;
    let after = module['$afterEachTest'] as AfterTest;
    let afterAll = module['$afterAllTests'] as AfterAllTests;

    await beforeAll?.();
    if (options.parallel) {
        await Promise.all(Object.entries(module)
            .filter(([key, fn]) => typeof fn === "function" && !key.startsWith("$"))
            .map(async ([key, fn]) => options.executor(key, fn, options.output, before, after))
        );
    } else {
        for (const key of Object.keys(module)) {
            const fn = module[key];
            if (typeof fn === "function" && !key.startsWith("$")) {
                await options.executor(key, fn, options.output, before, after);
            }
        }
    }
    await afterAll?.();
}

export class TestSuite {
    private readonly options: TestSuiteOptions
    private readonly modules = new Map<string, ModulePromise>();

    constructor(options?: TestSuiteOptions) {
        this.options = Object.assign({
            output: () => SilentSummary.INSTANCE,
            executor: defaultExecutor,
            parallel: true
        }, options);
    }

    addModule(moduleName: string, module: ModulePromise) {
        this.modules.set(moduleName, module)
        return this;
    }

    async execute() {
        await Promise.all([...this.modules.entries()].map(async ([moduleName, modulePromise]) => {
            const module = await modulePromise;

            const output = this.options.output(moduleName);
            output.module();
            await testModule(module, {
                parallel: this.options.parallel,
                output: output,
                executor: this.options.executor
            })
            output.total();
        }));
    }
}

export async function defaultExecutor(
    fnName: string,
    fnPtr: any,
    summary: TestOutput,
    before?: BeforeTest,
    after?: AfterTest
) {
    summary.execute(fnName);

    if (typeof fnPtr !== "function") {
        summary.fail(fnName, "Not a testable function");
        return;
    }

    try {
        await before?.(fnName, fnPtr);
        await fnPtr();
        summary.ok(fnName);
    } catch (err) {
        summary.fail(fnName, err)
    } finally {
        await after?.(fnName, fnPtr);
    }
}
