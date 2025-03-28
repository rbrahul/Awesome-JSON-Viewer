import { dump, load } from 'js-yaml';
import { XMLParser, XMLBuilder}  from "fast-xml-parser";

const XMLArrayRoot = "XMLArrayRoot";

export const trimXMLArrayRoot = (jsObject) => {
    if (!Array.isArray(jsObject) && XMLArrayRoot in jsObject) {
        jsObject =jsObject[XMLArrayRoot];
    }
    return jsObject;
}

export const convertToJsObject = (content, currentFormat) => {
    if (currentFormat === "YAML") {
        return load(content);
    }

    if (currentFormat === "XML") {
        const parser = new XMLParser();
        return parser.parse(content);
    }

    if (currentFormat === "JSON") {
        return JSON.parse(content);
    }
}

export const convertContent = (data, from, to) => {
    let result;
    let jsObject = convertToJsObject(data, from);

    if (to === 'JSON') {
        jsObject = trimXMLArrayRoot(jsObject)
        result = JSON.stringify(jsObject, null, 4);
    } else if (to === 'YAML') {
        jsObject = trimXMLArrayRoot(jsObject)
        result = dump(jsObject);
    } else if (to === 'XML') {
        const parserOptions = {
            arrayNodeName: XMLArrayRoot,
            format: true,
          };
        const builder = new XMLBuilder(parserOptions);
        result = builder.build(jsObject);
    }
    return result;
};
