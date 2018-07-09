


exports.asyncHelper = async (method) => {
    const result = await new Promise(resolve => {
        resolve(method());
    });
    return result;
}
