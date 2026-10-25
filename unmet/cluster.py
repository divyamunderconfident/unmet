"""Group needs that describe the same problem, using local embeddings."""

import numpy as np

from unmet.config import CLUSTER_THRESHOLD

_model = None


def embed(texts):
    """Unit-length all-MiniLM-L6-v2 vectors, computed locally."""
    global _model
    if _model is None:
        from fastembed import TextEmbedding  # slow import; tests replace embed()
        _model = TextEmbedding("sentence-transformers/all-MiniLM-L6-v2")
    vecs = np.array(list(_model.embed(texts)))
    return vecs / np.linalg.norm(vecs, axis=1, keepdims=True)


def cluster(needs, threshold=CLUSTER_THRESHOLD):
    """Lists of needs. Each need joins the most similar cluster centroid at or above threshold, else starts one.

    Order-dependent by design; needs come oldest first so yesterday's problems stay put when new needs arrive.
    """
    if not needs:
        return []
    vecs = embed([n["problem"] for n in needs])
    groups, sums = [], []
    for need, vec in zip(needs, vecs):
        if sums:
            cents = np.array(sums)
            sims = cents @ vec / np.linalg.norm(cents, axis=1)
            best = int(np.argmax(sims))
            if sims[best] >= threshold:
                groups[best].append(need)
                sums[best] = sums[best] + vec
                continue
        groups.append([need])
        sums.append(vec.copy())
    return groups
