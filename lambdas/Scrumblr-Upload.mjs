import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "us-east-2" });
const BUCKET = process.env.scrumblr_site_bucket;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,X-File-Name",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,DELETE",
};

export const handler = async (event) => {
  try {
    if (!BUCKET) throw new Error("Missing env var: scrumblr_site_bucket");

    const method =
      event.httpMethod || event.requestContext?.http?.method || "POST";

    // Preflight
    if (method === "OPTIONS") {
      return { statusCode: 200, headers: corsHeaders, body: "" };
    }

    // DELETE: /Scrumblr-Upload?key=uploads/whatever.png
    if (method === "DELETE") {
      const key =
        event.queryStringParameters?.key ||
        (event.body ? JSON.parse(event.body)?.key : null);

      if (!key) throw new Error("Missing key (send ?key=uploads/filename)");

      await s3.send(
        new DeleteObjectCommand({
          Bucket: BUCKET,
          Key: key,
        })
      );

      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "File deleted successfully",
          fileKey: key,
        }),
      };
    }

    if (method === "GET") {
      const prefix = "uploads/";
      const resp = await s3.send(
        new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: prefix,
        })
      );

      const items = (resp.Contents || [])
        .filter((o) => o.Key && o.Key !== prefix)
        .map((o) => ({
          fileKey: o.Key,
          fileName: o.Key.replace(prefix, ""),
          downloadUrl: `https://${BUCKET}.s3.amazonaws.com/${o.Key}`,
          lastModified: o.LastModified,
          size: o.Size,
        }))
        .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ success: true, items }),
      };
    }

    // POST upload
    if (method !== "POST") {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Method ${method} not allowed` }),
      };
    }

    if (!event.body) throw new Error("No file body received");

    const headers = event.headers || {};
    const filename =
      headers["x-file-name"] ||
      headers["X-File-Name"] ||
      `upload-${Date.now()}`;

    const fileType =
      headers["content-type"] ||
      headers["Content-Type"] ||
      "application/octet-stream";

    const fileContent = Buffer.from(
      event.body,
      event.isBase64Encoded ? "base64" : "utf8"
    );

    const key = `uploads/${filename}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileContent,
        ContentType: fileType,
      })
    );

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "File uploaded successfully",
        fileKey: key,
        downloadUrl: `https://${BUCKET}.s3.amazonaws.com/${key}`,
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: err?.message || "Request failed" }),
    };
  }
};
