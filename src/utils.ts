export function* iterateCodepoints(s : string) {
    for (let v of s) {
        yield v.codePointAt(0)!;
    }
}

export function joinStrings(separator : string, strings : Iterable<string>) : string {
    let result = "";
    let first = true;
    for (let s of strings) {
        if (first) {
            result = s;
            first = false;
        } else {
            result += separator;
            result += s;
        }
    }
    return result;
}

