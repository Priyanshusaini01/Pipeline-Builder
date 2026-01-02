from collections import defaultdict, deque
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Edge(BaseModel):
    id: Optional[str] = None
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class Pipeline(BaseModel):
    nodes: List[dict]
    edges: List[Edge]


def is_dag(edges: List[Edge]) -> bool:
    graph = defaultdict(list)
    indegree = defaultdict(int)
    nodes_in_graph = set()

    for edge in edges:
        if not edge.source or not edge.target:
            continue
        graph[edge.source].append(edge.target)
        indegree[edge.target] += 1
        nodes_in_graph.add(edge.source)
        nodes_in_graph.add(edge.target)

    queue = deque([node for node in nodes_in_graph if indegree[node] == 0])
    visited = 0

    while queue:
        node = queue.popleft()
        visited += 1
        for neighbor in graph[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)

    return visited == len(nodes_in_graph)


@app.get('/')
def read_root():
    return {'ping': 'pong'}


@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag_status = is_dag(pipeline.edges)
    return {'num_nodes': num_nodes, 'num_edges': num_edges, 'is_dag': dag_status}
