document.onload = () => console.log( "Le document est prêt" );
let PromesseDocumentPret = new Promise( (resolve) => {
    if (document.readyState === "complete") {
        resolve();
    } else {
        document.onreadystatechange = () => document.readyState === "complete" ? resolve() : null;
    }
});

/***********************************************************************************************************************
 * Utilitaires
 */
export function assertEqual<T>(a: T, b: T): boolean {
    switch (typeof a) {
        case "object":
            return JSON.stringify(a) === JSON.stringify(b);
        default:
            return a === b;
    }
}

const template = `
<hr/>
<table>
    <caption></caption>
    <thead>
        <th><h2></h2></th>
    </thead>
    <tbody></tbody>
</table>
`;

function toArgs(L: any[]): string {
    return L.map( v => JSON.stringify(v) ).join(", ");
}

export type Assertion = {args: any[], expectedResult: any, errorExpected?: boolean};
export function LogTests(title: string, fct: (...A) => any, fName: string, assertions: Assertion[]): void {
    PromesseDocumentPret.then( () => LogTestsOK(title, fct, fName, assertions) );
}
export function LogTestsOK(title: string, fct: (...A) => any, fName: string, assertions: Assertion[]): void {
    let section = document.createElement( "section" ),
        nbCorrects = 0,
        exceptionTriggered: boolean;
    section.innerHTML = template;
    section.querySelector( "h2" ).textContent = title;
    let tbody = section.querySelector( "tbody" );
    for (let {args, expectedResult, errorExpected} of assertions) {
        let tr  = document.createElement( "tr" );
        let res;
        try {
            res = fct.apply(null, args);
            exceptionTriggered = false;
        } catch (err) {
            res = err;
            exceptionTriggered = true;
        }
        let tdI = document.createElement( "td" ); tr.appendChild( tdI );
        tdI.innerHTML  = `<section><section class="root"></section><pre class="actual"></pre><pre class="expected"></pre></section>`;
        const sroot    = tdI.querySelector(".root"    ) as HTMLElement;
        const expected = tdI.querySelector(".expected") as HTMLElement;
        const actual   = tdI.querySelector(".actual"  ) as HTMLElement;
        
        sroot.textContent = `${fName}( ${toArgs(args)} )`; JSON.stringify( args );
        actual  .textContent = `   |    get ${JSON.stringify( res )}`;
        expected.textContent = `   | expect ${JSON.stringify( expectedResult )}`;
        // let tdO = document.createElement( "td" ); tr.appendChild( tdO ); tdO.textContent = JSON.stringify( res );
        // let tdE = document.createElement( "td" ); tr.appendChild( tdE ); tdE.textContent = JSON.stringify( expectedResult );
        if (assertEqual(res, expectedResult) && (typeof errorExpected === "undefined" || exceptionTriggered === errorExpected) ) {
            tr.classList.add( "correct" );
            nbCorrects++;
        } else {
            tr.classList.add( "incorrect" );
        }
        tbody.appendChild( tr );
    }
    section.querySelector( "caption" ).textContent = `Recap: ${nbCorrects} / ${assertions.length}`;
    document.body.appendChild( section );
}
