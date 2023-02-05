//aggiungi in manifest.json:

// "content_scripts": [
//     {
//         "world": "MAIN",
//         "js": [
//             "./src/content-script.js"
//         ],
//         "matches": [ "<all_urls>" ],
//         "all_frames": true,
//         "match_about_blank": true,
//         "match_origin_as_fallback": true,
//         "run_at": "document_start"
//     }
// ],