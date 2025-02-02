OV.FileSource =
{
    Url : 1,
    File : 2
};

OV.FileFormat =
{
    Text : 1,
    Binary : 2
};

OV.GetFileName = function (filePath)
{
	let firstSeparator = filePath.lastIndexOf ('/');
	if (firstSeparator === -1) {
		firstSeparator = filePath.lastIndexOf ('\\');
	}
	let fileName = filePath;
	if (firstSeparator !== -1) {
		fileName = filePath.substr (firstSeparator + 1);
	}
	let firstParamIndex = fileName.indexOf ('='); // Machine Analytics 
	if (firstParamIndex !== -1) {
		// fileName = fileName.substr (0, firstParamIndex);
		fileName = fileName.substr (firstParamIndex+1, fileName.length); // Machine Analytics  (/pcd?file=)
	}
	return decodeURI (fileName);
};

OV.GetFileExtension = function (filePath)
{
	let fileName = OV.GetFileName (filePath);
	let firstPoint = fileName.lastIndexOf ('.');
	if (firstPoint === -1) {
		return '';
	}
	return fileName.substr (firstPoint + 1);
};

OV.RequestUrl = function (url, format, callbacks)
{
	function OnSuccess (result)
	{
		if (callbacks.success) {
			callbacks.success (result);
		}
		if (callbacks.complete) {
			callbacks.complete ();
		}		
	}

	function OnError ()
	{
		if (callbacks.error) {
			callbacks.error ();
		}
		if (callbacks.complete) {
			callbacks.complete ();
		}
	}


	let request = new XMLHttpRequest ();
	request.open ('GET', url, true);
	if (format === OV.FileFormat.Text) {
		request.responseType = 'text';
	} else if (format === OV.FileFormat.Binary) {
		request.responseType = 'text' // Machine Analytics
	} else {
		OnError ();
		return;
	}

	// Machine Analytics
	request.onload = function () {
		if (request.status === 200) {
			let response = request.response;
			var binary_string = window.atob(response);
			var len = binary_string.length;
			var bytes = new Uint8Array(len);
			for (var i = 0; i < len; i++) {
				bytes[i] = binary_string.charCodeAt(i);
			}

			var zip = new JSZip();
			zip.loadAsync(binary_string).then(function(contents) {
				Object.keys(contents.files).forEach(function(filename) {
					zip.file(filename).async('uint8array').then(function(content) {
						console.log(content.buffer)
						OnSuccess(content.buffer);
					});
				});
			});

		} else {
			OnError ();
		}
	};
	//
	
	request.onerror = function () {
		OnError ();
	};

	request.send (null);
};

OV.ReadFile = function (file, format, callbacks)
{
	function OnSuccess (result)
	{
		if (callbacks.success) {
			callbacks.success (result);
		}
		if (callbacks.complete) {
			callbacks.complete ();
		}		
	}

	function OnError ()
	{
		if (callbacks.error) {
			callbacks.error ();
		}
		if (callbacks.complete) {
			callbacks.complete ();
		}
	}

	let reader = new FileReader ();

	reader.onloadend = function (event) {
		if (event.target.readyState === FileReader.DONE) {
			OnSuccess (event.target.result);
		}
	};
	
	reader.onerror = function () {
		OnError ();
	};

	if (format === OV.FileFormat.Text) {
		reader.readAsText (file);
	} else if (format === OV.FileFormat.Binary) {
		reader.readAsArrayBuffer (file);
	} else {
		OnError ();
	}
};
