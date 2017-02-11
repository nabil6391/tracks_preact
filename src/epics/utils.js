/**
 * Helper for building multipart requests for uploading to Drive.
 */

export class MultiPartBuilder {

  constructor() {
    this.boundary = Math.random().toString(36).slice(2);
    this.mimeType = 'multipart/mixed; boundary="' + this.boundary + '"';
    this.parts = [];
    this.body = null;
  }

  append(mimeType, content) {
    if(this.body !== null) {
      throw new Error("Builder has already been finalized.");
    }
    this.parts.push(
      "\r\n--", this.boundary, "\r\n",
      "Content-Type: ", mimeType, "\r\n\r\n",
      content);
    return this;
  };

  finish() {
    if (this.parts.length === 0) {
      throw new Error("No parts have been added.");
    }
    if (this.body === null) {
      this.parts.push("\r\n--", this.boundary, "--");
      this.body = this.parts.join('');
      // TODO - switch to blob once gapi.client.request allows it
      // this.body = new Blob(this.parts, {type: this.mimeType});
    }
    return {
      type: this.mimeType,
      body: this.body
    };
  };

};

