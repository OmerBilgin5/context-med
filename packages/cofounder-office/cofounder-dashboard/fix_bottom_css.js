const fs = require('fs');
let css = fs.readFileSync('style.css', 'utf8');

// Replace any remaining hardcoded backgrounds specifically for the dark mode issue
css = css.replace(/\.chat-container\s*{[^}]*background:\s*white;[^}]*}/g, function(match) {
    return match.replace(/background:\s*white;/, 'background: var(--color-surface-variant);');
});

css = css.replace(/\.specialized-workspace\s*{[^}]*background:\s*#f8fafc;[^}]*}/g, function(match) {
    return match.replace(/background:\s*#f8fafc;/, 'background: var(--color-surface);');
});

css = css.replace(/\.board-column\s*{[^}]*background:\s*#f1f5f9;[^}]*}/g, function(match) {
    return match.replace(/background:\s*#f1f5f9;/, 'background: var(--color-surface-variant);');
});

css = css.replace(/\.task-card\s*{[^}]*background:\s*white;[^}]*}/g, function(match) {
    return match.replace(/background:\s*white;/, 'background: rgba(255, 255, 255, 0.05);');
});

css = css.replace(/\.doc-card\s*{[^}]*background:\s*white;[^}]*}/g, function(match) {
    return match.replace(/background:\s*white;/, 'background: var(--color-surface-variant);');
});

fs.writeFileSync('style.css', css);
console.log('Fixed duplicate CSS backgrounds at bottom of file');
