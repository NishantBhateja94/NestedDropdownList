# NestedDropdownList
NestedDropdownList
use npm install to install all dependencies and run, npm run start command 
Installed dependencies
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers
DndContext manages drag state.

SortableContext + useSortable makes each item draggable.

Recursive <List> renders children inside nested SortableContexts.

onDragOver handles moving between levels:

Removes item from old location.

Inserts into target’s children.

Prevents moving into own descendants.
