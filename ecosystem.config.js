module.exports = {
	apps: [
		{
			'name': 'rss',
			// 'exec_mode': 'cluster',
			'cwd': 'api',
			'exec_interpreter': 'node',
			'script': 'src/workers/rss.js',
			'watch': true,
			'max_memory_restart': '1G',
			'autorestart': true,
			'instances': 1,
			'env': { 'NODE_ENV': 'development' },
			'log_date_format':'YYYY-MM-DD HH:mm:ss.SS Z',
			'env_production': { 'NODE_ENV': 'production' },
		},
		{
			'name': 'article',
			// 'exec_mode': 'cluster',
			'cwd': 'api',
			'exec_interpreter': 'node',
			'script': 'src/workers/article.js',
			'watch': true,
			'max_memory_restart': '1G',
			'autorestart': true,
			'instances': 1,
			'env': { 'NODE_ENV': 'development' },
			'log_date_format':'YYYY-MM-DD HH:mm:ss.SS Z',
			'env_production': { 'NODE_ENV': 'production' },
		},
		{
			'name': 'conductor',
			// 'exec_mode': 'cluster',
			'cwd': 'api',
			'exec_interpreter': 'node',
			'script': 'src/workers/conductor.js',
			'watch': true,
			'max_memory_restart': '1G',
			'autorestart': true,
			'instances': 1,
			'env': { 'NODE_ENV': 'development' },
			'log_date_format':'YYYY-MM-DD HH:mm:ss.SS Z',
			'env_production': { 'NODE_ENV': 'production' },
		},
		{
			'name': 'API',
			// 'exec_mode': 'cluster',
			'cwd': 'api',
			'exec_interpreter': 'node',
			'script': 'src/app.js',
			'watch': true,
			'max_memory_restart': '1G',
			'autorestart': true,
			'instances': 1,
			'env': { 'NODE_ENV': 'development' },
			'env_production': { 'NODE_ENV': 'production' },
			'log_date_format':'YYYY-MM-DD HH:mm:ss.SS Z',
		}]
	,

	deploy: {
		// "production" is the environment name
		production: {
			// SSH key path, default to $HOME/.ssh
			// key: "/path/to/some.pem",
			// SSH user
			// user: "ubuntu",
			// SSH host
			host: ["198.23.143.225"],
			// SSH options with no command-line flag, see 'man ssh'
			// can be either a single string or an array of strings
			// ssh_options: "StrictHostKeyChecking=no",
			// GIT remote/branch
			ref: 'origin/master',
			// GIT remote
			repo: 'https://github.com/saar/khabarkhun.git',
			// path in the server
			path: '/var/www/khabarkhun',
			// Pre-setup command or path to a script on your local machine
			'pre-setup': 'apt-get install git ; ls -la',
			// Post-setup commands or path to a script on the host machine
			// eg: placing configurations in the shared dir etc
			'post-setup': 'ls -la',
			// pre-deploy action
			'pre-deploy-local': 'echo \'This is a local executed command\'',
			// post-deploy action
			'post-deploy': 'npm install',
		},
	},
};
