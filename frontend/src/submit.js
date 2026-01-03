import { useState, useRef } from 'react';
import { useStore } from './store';

const apiBaseUrl = () => (process.env.REACT_APP_API_URL || '').trim().replace(/\/+$/, '');

export const SubmitButton = () => {
    const noticeTimer = useRef(null);
    const [notice, setNotice] = useState(null);
    const bannerTimer = useRef(null);
    const [banner, setBanner] = useState(null);
    const [summaryText, setSummaryText] = useState('');
    const { nodes, edges, removeSelected, clearAll, selectedNodes, selectedEdges } = useStore((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        removeSelected: state.removeSelected,
        clearAll: state.clearAll,
        selectedNodes: state.selectedNodes,
        selectedEdges: state.selectedEdges,
    }));

    const showNotice = (text, tone = 'info') => {
        if (noticeTimer.current) {
            clearTimeout(noticeTimer.current);
        }
        setNotice({ text, tone });
        noticeTimer.current = setTimeout(() => setNotice(null), 3600);
    };

    const showBanner = (text, tone = 'info') => {
        if (bannerTimer.current) {
            clearTimeout(bannerTimer.current);
        }
        setBanner({ text, tone });
        bannerTimer.current = setTimeout(() => setBanner(null), 5200);
    };

    const handleDeleteSelected = async () => {
        const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;

        if (!hasSelection) {
            showNotice('Select nodes or edges to delete first.', 'warn');
            return;
        }

        const apiBase = apiBaseUrl();
        const apiUrl = apiBase ? `${apiBase}/pipelines/nodes` : '/pipelines/nodes';
        const nodeIds = selectedNodes.map((n) => n.id);
        const edgeIds = selectedEdges.map((e) => e.id);

        let remoteSucceeded = false;

        try {
            const response = await fetch(apiUrl, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ node_ids: nodeIds, edge_ids: edgeIds }),
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const payload = await response.json();
            const deletedNodes = payload?.deleted_nodes ?? nodeIds.length;
            const deletedEdges = payload?.deleted_edges ?? edgeIds.length;
            showNotice(`Deleted ${deletedNodes} node${deletedNodes === 1 ? '' : 's'} and ${deletedEdges} edge${deletedEdges === 1 ? '' : 's'}.`, 'success');
            remoteSucceeded = true;
        } catch (error) {
            showNotice(`Delete request failed: ${error.message}. Removed locally.`, 'warn');
        } finally {
            removeSelected();
        }

        if (!remoteSucceeded && apiBase) {
            showBanner('Could not sync delete to server. Check the API URL and connectivity.', 'warn');
        }
    };

    const handleSubmit = async () => {
        if (!nodes.length) {
            showNotice('Add at least one node before submitting.', 'warn');
            return;
        }

        const apiBase = apiBaseUrl();
        const apiUrl = apiBase ? `${apiBase}/pipelines/parse` : '/pipelines/parse';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodes, edges }),
            });

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const payload = await response.json();
            const { num_nodes, num_edges, is_dag } = payload;

            const summary = `Nodes: ${num_nodes} • Edges: ${num_edges} • DAG: ${is_dag ? 'Yes' : 'No'}`;
            showNotice(summary, 'success');
            showBanner('Pipeline submitted successfully.', 'success');

            try {
                const snapshot = { nodes, edges, response: payload, savedAt: new Date().toISOString() };
                window?.localStorage?.setItem('pipeline:last', JSON.stringify(snapshot));
            } catch (_err) {
                // ignore storage issues
            }
        } catch (error) {
            showNotice(`Submit failed: ${error.message}`, 'error');
            showBanner('Submit failed. Please try again.', 'error');
        }
    };

    const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0;
    const hasGraph = nodes.length > 0 || edges.length > 0;

    const summarize = () => {
        if (!hasGraph) {
            showNotice('No nodes to summarize.', 'warn');
            return;
        }

        const formatData = (data = {}) => {
            const entries = Object.entries(data)
                .filter(([key]) => key !== 'id' && key !== 'nodeType')
                .slice(0, 4)
                .map(([k, v]) => `${k}: ${String(v)}`);
            return entries.length ? ` | ${entries.join(', ')}` : '';
        };

        const nodeLines = nodes.map((n) => `- ${n.id} (${n.type})${formatData(n.data)}`);
        const edgeLines = edges.map((e) => `- ${e.source}${e.sourceHandle ? `:${e.sourceHandle}` : ''} -> ${e.target}${e.targetHandle ? `:${e.targetHandle}` : ''}`);

        const summary = `Pipeline summary\nNodes (${nodes.length})\n${nodeLines.join('\n')}\n\nEdges (${edges.length})\n${edgeLines.join('\n')}`;

        setSummaryText(summary);
        showNotice('Summary ready.', 'info');
    };

    return (
        <>
            <div className="submit-bar">
                {banner ? (
                    <div className={`inline-alert ${banner.tone}`}>
                        <span>{banner.text}</span>
                    </div>
                ) : null}
                <div className="button-group">
                    <button type="button" className="ghost-btn" disabled={!hasSelection} onClick={handleDeleteSelected}>
                        Delete Selected
                    </button>
                    <button type="button" className="ghost-btn" disabled={!hasGraph} onClick={clearAll}>
                        Clear All
                    </button>
                    <button type="button" className="ghost-btn" disabled={!hasGraph} onClick={summarize}>
                        Show Summary
                    </button>
                </div>
                <button type="button" className="primary-btn" onClick={handleSubmit}>
                    Submit Pipeline
                </button>
            </div>

            {notice ? (
                <div className={`toast ${notice.tone}`}>
                    <span>{notice.text}</span>
                </div>
            ) : null}

            {summaryText ? (
                <div className="summary-panel">
                    <div className="summary-header">
                        <span>Pipeline Summary</span>
                        <button className="ghost-btn sm" onClick={() => setSummaryText('')}>Close</button>
                    </div>
                    <pre>{summaryText}</pre>
                </div>
            ) : null}
        </>
    );
};
