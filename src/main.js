import 'bootstrap';

import authConfig from 'auth/authConfig';

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()

    // registers global resources
    .feature('resources')

    .plugin('aurelia-authentication', baseConfig => {
        baseConfig.configure(authConfig);
    })

    .plugin('aurelia-google-maps', config => {
			config.options({
				apiKey: 'AIzaSyBUTbBmV57ZxYULwWqbBz-S2vGFfrHknKk',
        apiLibraries: 'drawing,geometry' //get optional libraries like drawing, geometry, ... - comma seperated list
			});
		});
    //Uncomment the line below to enable animation.
    //aurelia.use.plugin('aurelia-animator-css');
    //if the css animator is enabled, add swap-order="after" to all router-view elements

    //Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
    //aurelia.use.plugin('aurelia-html-import-template-loader')

  aurelia.start().then(() => aurelia.setRoot());
}
