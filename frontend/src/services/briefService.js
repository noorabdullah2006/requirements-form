const API_URL = `${import.meta.env.VITE_API_URL}/api/projects`;

/**
 * submitBrief — sends all 10 steps' data + files to the backend.
 *
 * WHY FormData?
 *   The form includes file uploads (binary data).
 *   Browsers can only send binary files inside multipart/form-data.
 *   That's why we use FormData instead of JSON.stringify().
 *
 * WHY JSON.stringify for arrays?
 *   multipart/form-data can't send nested arrays natively.
 *   We serialize arrays (pages, features) to JSON strings and
 *   the backend parses them back with JSON.parse().
 */
export const submitBrief = async (allData, files) => {
    const fd = new FormData();

    // ── Step 1: Client Info ────────────────────────────────────────────────
    fd.append('fullName',    allData.s1.fullName);
    fd.append('email',       allData.s1.email);
    fd.append('phone',       allData.s1.phone);
    fd.append('companyName', allData.s1.companyName);
    fd.append('businessType',
        allData.s1.businessType === 'Other'
            ? allData.s1.otherBusinessType
            : allData.s1.businessType
    );

    // ── Step 2: Project Info ───────────────────────────────────────────────
    fd.append('projectType',
        allData.s2.projectType === 'Other'
            ? allData.s2.otherProjectType
            : allData.s2.projectType
    );
    fd.append('businessDescription', allData.s2.businessDescription);
    fd.append('projectGoal',
        allData.s2.projectGoal === 'Other'
            ? allData.s2.otherProjectGoal
            : allData.s2.projectGoal
    );

    // ── Step 3: Pages (array → JSON string) ──────────────────────────────
    const pages = allData.s3.pages.filter(p => p !== 'Other');
    if (allData.s3.otherPage) pages.push(allData.s3.otherPage);
    fd.append('pages', JSON.stringify(pages));

    // ── Step 4: Features (array → JSON string) ────────────────────────────
    const features = allData.s4.features.filter(f => f !== 'Other');
    if (allData.s4.otherFeature) features.push(allData.s4.otherFeature);
    fd.append('features', JSON.stringify(features));

    // ── Step 5: Design ─────────────────────────────────────────────────────
    fd.append('designStyle',
        allData.s5.designStyle === 'Other'
            ? allData.s5.otherDesignStyle
            : allData.s5.designStyle
    );
    fd.append('preferredColors',     allData.s5.preferredColors);
    fd.append('hasExistingBranding', allData.s5.hasExistingBranding);
    fd.append('referenceUrls',       allData.s5.referenceUrls);

    // ── Step 6: Content ────────────────────────────────────────────────────
    fd.append('contentStatus',     allData.s6.contentStatus);
    fd.append('availableAssets',   JSON.stringify(allData.s6.availableAssets));

    // ── Step 7: Domain & Hosting ───────────────────────────────────────────
    fd.append('hasDomain',      allData.s7.hasDomain);
    fd.append('domain',         allData.s7.domain);
    fd.append('hasHosting',     allData.s7.hasHosting);
    fd.append('hostingDetails', allData.s7.hostingDetails);

    // ── Step 8: Budget & Timeline ──────────────────────────────────────────
    fd.append('budget',   allData.s8.budget);
    fd.append('deadline', allData.s8.deadline);
    fd.append('urgency',  allData.s8.urgency);

    // ── Step 9: Files (binary — must use FormData) ─────────────────────────
    if (files && files.length > 0) {
        files.forEach(file => fd.append('files', file));
    }

    // ── Step 10: Additional Info ───────────────────────────────────────────
    fd.append('additionalNotes',       allData.s10.additionalNotes);
    fd.append('communicationMethod',   allData.s10.communicationMethod);

    // ── Send request ───────────────────────────────────────────────────────
    // Note: DO NOT set Content-Type header manually.
    // The browser sets it automatically with the correct multipart boundary.
    const response = await fetch(API_URL, {
        method: 'POST',
        body: fd
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Submission failed');
    }
    return data;
};
