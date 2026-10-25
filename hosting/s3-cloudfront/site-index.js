// CloudFront Function (JavaScript runtime 2.0) for the site distribution, on viewer request: a
// folder's address is answered by its index.html, as Parallax's open site expects (docs/
// publishing.md, S3 and CloudFront). Adapted from AWS's example "Add index.html to request URLs
// without a file name"; the check for an extension looks at the last segment only.
async function handler(event) {
  var request = event.request;
  var uri = request.uri;
  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  } else if (!uri.split('/').pop().includes('.')) {
    request.uri += '/index.html';
  }
  return request;
}
