
const dotenv = require('dotenv');

function format(seconds){
    function pad(s){
        return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60*60));
    var minutes = Math.floor(seconds % (60*60) / 60);
    var seconds = Math.floor(seconds % 60);

    return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

module.exports = async function (context, req) {

    const type = req.params.type;

    if(type === undefined || type == "" || type === null){
        context.res = {
            status: 200,
            body: { time: new Date().toISOString() }
        };
        return;

    }else if(type === "uptime"){
        const uptime = process.uptime();
        const uptimeOutput = format(uptime);
        context.res = {
            status: 200,
            body: { uptimeOutput }
        };
        return;

    }else if(type === "sys"){
        const sys = process.env;
        context.res = {
            status: 200,
            body: { sys }
        };
        return;

    }else if(type === "exec_path"){

        const exec_path = process.execPath;
        context.res = {
            status: 200,
            body: exec_path
        };
        return;
    }else if(type === "memory"){
        const memory_usage = process.memoryUsage();
        context.res = {
            status: 200,
            body: memory_usage
        };
        return;
    }else if(type === "pid"){
        const pid = process.pid;
        context.res = {
            status: 200,
            body: pid
        };
        return;
    }else if(type === "platform"){
        const platform = process.platform;
        context.res = {
            status: 200,
            body: platform
        };
        return;
    }else if(type === "report"){
        const report = process.report;
        context.res = {
            status: 200,
            body: report
        };
        return;
    }else if(type === "resources"){
        const resources = process.resourceUsage();
        context.res = {
            status: 200,
            body: resources
        };
        return;
    }

}
