export const getAppliedTransformation = (
    element:HTMLElement
):Record<string, string|number> => {
    const translateAttr = element.getAttribute('transform');
    const appliedTransforms:Record<string, string|number> = {};
    if (translateAttr) {
        const translatePattern =
            /translate\((-?\d+\.?\d*)+,\s*(-?\d+\.?\d*)+\)/;
        const scalePattern = /scale\((-?\d+\.?\d*)+\)/;
        const translateExecResult = translatePattern.exec(translateAttr);

        if (translateExecResult) {
            appliedTransforms['translate'] = translateExecResult?.[0];
            appliedTransforms['translateX'] = Number(translateExecResult?.[1]);
            appliedTransforms['translateY'] = Number(translateExecResult?.[2]);
        }
        const scalePatternExecResult = scalePattern.exec(translateAttr);
        if (scalePatternExecResult) {
            appliedTransforms['scale'] = scalePatternExecResult?.[0];
            appliedTransforms['scaleValue'] = Number(
                scalePatternExecResult?.[1],
            );
        }
    }
    return appliedTransforms;
};
