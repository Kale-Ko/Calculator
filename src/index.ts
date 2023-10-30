import * as Elements from "./elements";
import Parser from "./parser";
import Solver from "./solver";

class Instance {
    protected rootElement: HTMLDivElement;

    protected inputElement: HTMLInputElement;
    protected outputElement: HTMLSpanElement;

    public constructor() {
        this.rootElement = document.querySelector("#calculator") as HTMLDivElement;

        this.inputElement = this.rootElement.querySelector(".calculator_input") as HTMLInputElement;
        this.outputElement = this.rootElement.querySelector(".calculator_output") as HTMLSpanElement;
    }

    public init(): void {
        this.inputElement.addEventListener("keydown", (event: KeyboardEvent): void => {
            let key: string = event.key.toLowerCase();

            if (key === "enter") {
                this.calculate();
            }
        });

        this.calculate();
    }

    public calculate(): void {
        try {
            console.log("Input", this.inputElement.value);

            let parser: Parser = new Parser(this.inputElement.value);
            let tree: Elements.ParsedTree = parser.parse();

            console.log("Parsed", JSON.stringify(tree, null, 2));

            let solver: Solver = new Solver(tree);
            let result: number = solver.solve();

            console.log("Solved", result.toString());

            this.outputElement.innerText = result.toString();
        } catch (e: any) {
            this.outputElement.innerText = "ERR";

            console.warn(e);
        }
    }
}

export { Elements, Parser, Solver, Instance };