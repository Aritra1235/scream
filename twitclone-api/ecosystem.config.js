module.exports = {
    apps: [
      {
        name: "twitclone-api",
        script: "bun",
        args: "start",                     // bun start
        cwd: ".",                          // root folder
        interpreter: "none",               // avoids Node interpreter
        instances: "max",
        exec_mode: "cluster",
        autorestart: true,
        watch: false,
        env: {
          NODE_ENV: "production"
        },
        max_memory_restart: "1G"
      }
    ]
  };
  