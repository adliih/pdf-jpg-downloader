{
  "id": "pdf-jpg-downloader-ovq2",
  "lang": "typescript",
  "build": {
    // Enables cgo when building the application and running tests
    // in Encore's CI/CD system.
    "cgo_enabled": false,

    // Docker-related configuration
    "docker": {
      // The Docker base image to use when deploying the application.
      // It must be a publicly accessible image, and defaults to "scratch".
      "base_image": "node:20-alpine",

      // Whether to bundle the source code in the docker image.
      // The source code will be copied into /workspace as part
      // of the build process. This is primarily useful for tools like
      // Sentry that need access to the source code to generate stack traces.
      "bundle_source": false,

      // The working directory to start the docker image in.
      // If empty it defaults to "/workspace" if the source code is bundled, and to "/" otherwise.
      "working_dir": ""
    }
  }
}
