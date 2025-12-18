#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { URL } from 'url';

// Set to track processed URLs to avoid cycles and redundant downloads
const processedUrls = new Set();

async function fetchAndSave(url, outputPath, downloadQueue, detailsQueue) {
  if (processedUrls.has(url)) return;
  processedUrls.add(url);

  console.log(`Fetching ${url}...`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();

    // Process data to find media files
    findAndReplaceFiles(data, downloadQueue);

    // Process data to find self links and queue them
    processSelfLinks(data, detailsQueue);

    // Ensure directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    console.log(`Saved to ${outputPath}`);
  } catch (error) {
    console.error(`Error processing ${url}:`, error);
    // Don't exit process, just log error so other files can proceed
  }
}

function findAndReplaceFiles(obj, downloadQueue) {
  if (Array.isArray(obj)) {
    obj.forEach((item) => findAndReplaceFiles(item, downloadQueue));
  } else if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key === 'files' && Array.isArray(obj[key])) {
        obj[key].forEach((fileObj) => {
          if (fileObj.file && typeof fileObj.file === 'string' && fileObj.file.startsWith('http')) {
            const url = fileObj.file;
            const urlObj = new URL(url);
            const filename = path.basename(urlObj.pathname);
            const localPath = path.join('media', filename);
            fileObj.file = `/data/${localPath}`;
            downloadQueue.push({ url, localPath });
          }
        });
      } else {
        findAndReplaceFiles(obj[key], downloadQueue);
      }
    }
  }
}

function processSelfLinks(obj, detailsQueue) {
  if (Array.isArray(obj)) {
    obj.forEach((item) => processSelfLinks(item, detailsQueue));
  } else if (obj && typeof obj === 'object') {
    if (obj.self && typeof obj.self === 'string' && obj.self.startsWith('http')) {
      const originalUrl = obj.self;
      try {
        const urlObj = new URL(originalUrl);
        const parts = urlObj.pathname.split('/').filter((p) => p);
        // e.g. api/v1/sessions/233

        let localPath = null;
        if (originalUrl.includes('/sessions/')) {
          const id = parts[parts.length - 1];
          localPath = `sessions/${id}.json`;
        } else if (originalUrl.includes('/papers/')) {
          const id = parts[parts.length - 1];
          localPath = `papers/${id}.json`;
        } else if (originalUrl.includes('/keynotes/')) {
          const id = parts[parts.length - 1];
          localPath = `keynotes/${id}.json`;
        }

        if (localPath) {
          obj.self = `/data/${localPath}`; // Rewrite to relative path
          detailsQueue.push({ url: originalUrl, localPath });
        }
      } catch (e) {
        console.warn(`Could not parse self URL: ${originalUrl}`);
      }
    }

    for (const key in obj) {
      if (key !== 'self') {
        processSelfLinks(obj[key], detailsQueue);
      }
    }
  }
}

async function downloadMedia(queue, outputDir) {
  const mediaDir = path.join(outputDir, 'media');
  await fs.mkdir(mediaDir, { recursive: true });

  for (const item of queue) {
    const outputPath = path.join(outputDir, item.localPath);

    try {
      await fs.access(outputPath);
      continue;
    } catch {}

    console.log(`Downloading media ${item.url}...`);
    try {
      const response = await fetch(item.url);
      if (!response.ok) {
        console.error(`Failed to download ${item.url}: ${response.status}`);
        continue;
      }
      const arrayBuffer = await response.arrayBuffer();
      await fs.writeFile(outputPath, Buffer.from(arrayBuffer));
    } catch (e) {
      console.error(`Error downloading ${item.url}:`, e);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error('Usage: evan-archive <api_endpoint> <event_code> <output_dir>');
    process.exit(1);
  }

  const [apiEndpoint, eventCode, outputDir] = args;
  const normalizedApiEndpoint = apiEndpoint.endsWith('/') ? apiEndpoint : `${apiEndpoint}/`;
  const baseUrl = `${normalizedApiEndpoint}events/${eventCode}/`;

  await fs.mkdir(outputDir, { recursive: true });

  const resources = [
    { endpoint: '', file: 'event.json' },
    { endpoint: 'contents/', file: 'contents.json' },
    { endpoint: 'sessions/', file: 'sessions.json' },
    { endpoint: 'papers/', file: 'papers.json' },
    { endpoint: 'keynotes/', file: 'keynotes.json' },
  ];

  const downloadQueue = [];
  const detailsQueue = [];

  // Initial fetch
  for (const resource of resources) {
    await fetchAndSave(
      `${baseUrl}${resource.endpoint}`,
      path.join(outputDir, resource.file),
      downloadQueue,
      detailsQueue,
    );
  }

  // Process details queue
  let i = 0;
  while (i < detailsQueue.length) {
    const item = detailsQueue[i];
    i++;

    if (processedUrls.has(item.url)) continue;

    await fetchAndSave(item.url, path.join(outputDir, item.localPath), downloadQueue, detailsQueue);
  }

  if (downloadQueue.length > 0) {
    console.log(`Downloading ${downloadQueue.length} media files...`);
    await downloadMedia(downloadQueue, outputDir);
  }

  console.log('Archive completed successfully.');
}

main();
