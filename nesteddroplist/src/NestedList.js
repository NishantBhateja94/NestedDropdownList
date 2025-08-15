import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const initialData = [
  {
    id: "1",
    title: "Item 1",
    children: [
      { id: "1-1", title: "Item 1.1", children: [] },
      { id: "1-2", title: "Item 1.2", children: [] }
    ]
  },
  {
    id: "2",
    title: "Item 2",
    children: []
  }
];

// Recursive find
function findItem(items, id) {
  for (let item of items) {
    if (item.id === id) return item;
    const found = findItem(item.children, id);
    if (found) return found;
  }
  return null;
}

// Remove item from tree
function removeItem(items, id) {
  for (let i = 0; i < items?.length; i++) {
    if (items?.[i]?.id === id) {
      return items.splice(i, 1)[0];
    }
    const removed = removeItem(items?.[i]?.children, id);
    if (removed) return removed;
  }
  return null;
}

// Check descendant
function isDescendant(parent, childId) {
  if (parent?.id === childId) return true;
  return parent?.children.some((c) => isDescendant(c, childId));
}

export default function NestedList() {
  const [data, setData] = useState(initialData);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeItem = findItem(data, active.id);
    const overItem = findItem(data, over.id);

    // Prevent circular
    if (isDescendant(activeItem, over.id)) return;

    if (active.id !== over.id) {
      setData((items) => {
        const cloned = JSON.parse(JSON.stringify(items));
        const dragged = removeItem(cloned, active.id);

        // Drop into over item if possible
        if (overItem) {
          overItem.children.push(dragged);
        }
        return cloned;
      });
    }
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={data.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <List items={data} />
      </SortableContext>
    </DndContext>
  );
}

function List({ items }) {
  return (
    <div style={{ paddingLeft: 10 }}>
      {items.map((item) => (
        <React.Fragment key={item.id}>
          <SortableItem id={item.id} title={item.title} />
          {item.children.length > 0 && (
            <SortableContext
              items={item.children.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <List items={item.children} />
            </SortableContext>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function SortableItem({ id, title }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    border: "1px solid #ccc",
    margin: "4px 0",
    padding: "8px",
    background: "#fff",
    transform: CSS.Transform.toString(transform),
    transition
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {title}
    </div>
  );
}
