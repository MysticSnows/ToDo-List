
// exports works like module.exports
exports.currDay = function(){
    const date = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    return date.toLocaleDateString("en-US", options);
}