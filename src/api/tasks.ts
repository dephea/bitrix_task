import { Router, type Request, type Response } from "express";
import axios from "axios";

import { body, param, query, validationResult} from "express-validator";

import { mapCreateTaskRequest, mapCreateTaskResponse, mapGetTasksResponse, mapGetTasksRequest,
    mapGetOneTaskResponse, mapCreateCommentRequest, mapGetCommentsResponse
 } from "../util/fieldMapper.ts"
import { sendResponse, sendError } from "../util/response.ts";
import { BITRIX_WEBHOOK_URL } from "../index.ts";

const router = Router();

router.post("/", [
    body("title").isString().notEmpty().withMessage("title is required"),
    body("description").optional().isString().withMessage("description must be a string"),
    body("priority").optional().isInt({ min: 0, max: 2}).withMessage("priority must be 0, 1 or 2"),
    body("assignee").optional().isInt().withMessage("assignee must be an id number"),
    body("due_at").optional().isISO8601({strict: true}).withMessage("due_at must be a valid ISO8601 date")
], async (req: Request, res: Response) => {

    console.log("Got a http request in /create")

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendError(res, "VALIDATION_ERROR", errors.array(), 400);
    }


    try {
        const bitrix_fields = mapCreateTaskRequest(req.body)

        console.log(`${BITRIX_WEBHOOK_URL}`)

        const response = await axios.post(`${BITRIX_WEBHOOK_URL}/tasks.task.add`,
            {
                fields: {...bitrix_fields, STATUS: 2}
            }
        );

        console.log(response.data)

        const mappedResponse = mapCreateTaskResponse(response.data);

        return sendResponse(res, mappedResponse);
    } catch (error: any) {
        console.error("Error creating task:", error.response?.data || error.message);

        return sendError(res, "BITRIX_API_ERROR", error.response?.data || error.message, 500);
    }

    

})


router.get("/", [
    query("status").optional().isInt({ min: 1, max: 7 }).withMessage("status must be between 1 and 7"),
    query("assignee").optional().isInt().withMessage("assignee must be an id number"),
    query("created_from").optional().isISO8601({strict: true}).withMessage("created_from must be a valid ISO8601 date"),
    query("created_to").optional().isISO8601({strict: true}).withMessage("created_to must be a valid ISO8601 date"),
    query("due_from").optional().isISO8601({strict: true}).withMessage("due_from must be a valid ISO8601 date"),
    query("due_to").optional().isISO8601({strict: true}).withMessage("due_to must be a valid ISO8601 date"),
    query("offset").optional().isInt({ min: 0 }).withMessage("offset must be a non-negative integer")
    .custom((value) => {
        if (value % 50 !== 0) {
            throw new Error("offset must be a multiple of 50");
        }
        return true;
    }),
] ,async (req: Request, res: Response) => {
    console.log("got into get task /")

    const offset = typeof req.query.offset === "string" ? parseInt(req.query.offset) : 0;
    

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "VALIDATION_ERROR", errors.array(), 400);
    }

    try {
        const response = await axios.get(`${BITRIX_WEBHOOK_URL}/tasks.task.list`, {
            params: {
                filter: mapGetTasksRequest(req.query),
                start: offset,

            }
        })
        

        const mappedResponse = mapGetTasksResponse(response.data);

        return sendResponse(res, {...mappedResponse, pagination: {
            offset: offset,
            total: response.data?.total || 0
        }});
    } catch (error: any) {
        console.error("Error getting tasks:", error.response?.data || error.message);

        return sendError(res, "BITRIX_API_ERROR", error.response?.data || error.message, 500);
    }
})

router.get("/:id", [
    param("id").isInt().withMessage("id must be an id number")
], async (req: Request, res: Response) => {
    const taskId = req.params.id;

    console.log("got into get task by id /:id", taskId)

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendError(res, "VALIDATION_ERROR", errors.array(), 400);
    }

    try {
        const response = await axios.get(`${BITRIX_WEBHOOK_URL}/tasks.task.get`, {
            params: {
                taskId: taskId,
                select: ["ID", "TITLE", "DESCRIPTION", "CREATED_BY", "RESPONSIBLE_ID", "PRIORITY", "STATUS", "DEADLINE"]
            }
        })

        const mappedResponse = mapGetOneTaskResponse(response.data);

        return sendResponse(res, mappedResponse);
    } catch (error: any) {
        console.error("Error creating a task:", error.response?.data || error.message);

        return sendError(res, "BITRIX_API_ERROR", error.response?.data || error.message, 500);
    }

})

router.patch("/:id", [
    param("id").isInt().withMessage("id must be an id number"),
    body("title").optional().isString().withMessage("title must be a string"),
    body("description").optional().isString().withMessage("description must be a string"),
    body("priority").optional().isInt({ min: 0, max: 2}).withMessage("priority must be 0, 1 or 2"),
    body("assignee").isInt().withMessage("assignee must be an id number"), // not optional on bitrix side
    body("due_at").optional().isISO8601({strict: true}).withMessage("due_at must be a valid ISO8601 date"),
    body("status").isInt({ min: 2, max: 6}).withMessage("status must be between 2 and 6") // not optional on bitrix side
], async (req: Request, res: Response) => {
    const taskId = req.params.id;

    console.log("got into patch task by id /:id", taskId)

    const mappedBody = mapCreateTaskRequest(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendError(res, "VALIDATION_ERROR", errors.array(), 400);
    }

    try {
        const response = await axios.post(`${BITRIX_WEBHOOK_URL}/tasks.task.update`, {
            taskId: taskId,
            fields: mappedBody
        })

        const mappedResponse = mapCreateTaskResponse(response.data);

        return sendResponse(res, mappedResponse);
    } catch (error: any) {
        console.error("Error updating a task:", error.response?.data || error.message);

        return sendError(res, "BITRIX_API_ERROR", error.response?.data || error.message, 500);
    }
})

router.delete("/:id", [
    param("id").isInt().withMessage("id must be an id number")
], async (req: Request, res: Response) => {
    const taskId = req.params.id;

    console.log("got into delete task by id /:id", taskId)

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendError(res, "VALIDATION_ERROR", errors.array(), 400);
    }

    try {
        const response = await axios.post(`${BITRIX_WEBHOOK_URL}/tasks.task.delete`, {
            taskId: taskId
        })


        return sendResponse(res, { success: response.data?.result.task });
    } catch (error: any) {
        console.error("Error deleting a task:", error.response?.data || error.message);

        return sendError(res, "BITRIX_API_ERROR", error.response?.data || error.message, 500);
    }
})

///////////////////////////// comments 

router.post("/:id/comments", [
    param("id").isInt().withMessage("id must be an id number"),
    body("message").isString().notEmpty().withMessage("message is required"),
    body("authorId").optional().isInt().withMessage("authorId must be an id number")
], async (req: Request, res: Response) => {
    const taskId = req.params.id;

    console.log("got into post comment to task  /:id/comments", taskId)

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return sendError(res, "VALIDATION_ERROR", errors.array(), 400);
    }


    try {
        const response = await axios.post(`${BITRIX_WEBHOOK_URL}/task.commentitem.add`, {
            taskId: taskId,
            fields: mapCreateCommentRequest(req.body)
        })


        return sendResponse(res, { commentId: response.data?.result});
    } catch (error: any) {
        console.error("Error commenting on a task:", error.response?.data || error.message);

        return sendError(res, "BITRIX_API_ERROR", error.response?.data || error.message, 500);
    }
})


router.get("/:id/comments", async (req: Request, res: Response) => {
    const taskId = req.params.id;

    console.log("got into get comments of task  /:id/comments", taskId)

    try {
        const response = await axios.post(`${BITRIX_WEBHOOK_URL}/task.commentitem.getlist`, {
            taskId: taskId,
        })

        const mappedResponse = mapGetCommentsResponse(response.data);

        return sendResponse(res, mappedResponse);

    } catch (error: any) {
        console.error("Error getting comments:", error.response?.data || error.message);

        return sendError(res, "BITRIX_API_ERROR", error.response?.data || error.message, 500);
    }
})

export default router;