const PRIORITY_MAP: Record<string, string> = {
    "2": "Высокий",
    "1": "Средний",
    "0": "Низкий"
}

const STATUS_MAP: Record<string, string> = {
    "2": "Ждёт выполнения",
    "3": "Выполняется",
    "4": "Ожидает контроля",
    "5": "Завершена",
    "6": "Отложена"
}



export function mapCreateTaskRequest(task: any) {

    const allowedFields = ["title", "description", "assignee", "priority", "due_at", "status"];
    const extraFields = Object.keys(task).filter(key => !allowedFields.includes(key));

    if (extraFields.length > 0) {
        throw {
            code: "VALIDATION_ERROR",
            message: "Unexpected fields in request body: " + extraFields,
        };
    }


    return {
        TITLE: task.title,
        DESCRIPTION: task.description,
        RESPONSIBLE_ID: String(task.assignee),
        PRIORITY: String(task.priority),
        DEADLINE: task.due_at,
        STATUS: String(task.status) // for update only
    }
}

export function mapCreateTaskResponse(bitrixData: any) {
    const task = bitrixData.result?.task;

    return {
        id: task.id,
        title: task.title,
        description: task.description,
        creator: task.creator.id,
        assignee: task.responsible.id,
        priority: PRIORITY_MAP[task.priority],
        status: STATUS_MAP[task.status],
        due_at: task.deadline,

    }
}

export function mapGetTasksRequest(query: any) {
    const filter: Record<string, any> = {};

    if (query.created_from) filter['>=CREATED_DATE'] = query.created_from;
    if (query.created_to) filter['<=CREATED_DATE'] = query.created_to;
    if (query.due_from) filter['>=DEADLINE'] = query.due_from;
    if (query.due_to) filter['<=DEADLINE'] = query.due_to;
    if (query.status) filter.REAL_STATUS = query.status;
    if (query.assignee) filter.RESPONSIBLE_ID = query.assignee;

    return filter;
}

export function mapGetTasksResponse(bitrixData: any) {
    if (!bitrixData?.result?.tasks) {
        return { tasks: [] };
    }


    const tasks = bitrixData.result.tasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        creator: task.creator.id,
        assignee: task.responsible.id,
        priority: PRIORITY_MAP[task.priority],
        status: STATUS_MAP[task.status],
        due_at: task.deadline,
    }));

    return { tasks };
}

export function mapGetOneTaskResponse(bitrixData: any) {
    const task = bitrixData.result?.task;
    if (!task) return null;

    return {
        id: task.id,
        title: task.title,
        description: task.description,
        creator: task.creator.id,
        assignee: task.responsible.id,
        priority: PRIORITY_MAP[task.priority],
        status: STATUS_MAP[task.status],
        due_at: task.deadline,
    }
}

export function mapCreateCommentRequest(comment: any) {
    const allowedFields = ["authorId", "message"];
    const extraFields = Object.keys(comment).filter(key => !allowedFields.includes(key));

    if (extraFields.length > 0) {
        throw {
            code: "VALIDATION_ERROR",
            message: "Unexpected fields in request body: " + extraFields,
        };
    }

    return {
        POST_MESSAGE: comment.message,
        AUTHOR_ID: comment.authorId
    }
}

export function mapGetCommentsResponse(bitrixData: any) {
    if (!bitrixData?.result) {
        return { comments: [] };
    }

    const comments = bitrixData.result.map((comment: any) => ({
        id: comment.ID,
        authorId: comment.AUTHOR_ID,
        message: comment.POST_MESSAGE,
        createdAt: comment.POST_DATE
    }));

    return { comments };
}   
