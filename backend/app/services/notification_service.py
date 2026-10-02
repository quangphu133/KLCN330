from sqlalchemy.orm import Session

from app.models.notification import CallNotification


def create_once(
    db: Session,
    *,
    user_id: int | None,
    event_key: str,
    event_type: str,
    title: str,
    message: str,
    call_record_id: int | None = None,
    asr_job_id: int | None = None,
) -> None:
    if user_id is None or db.query(CallNotification.id).filter(CallNotification.event_key == event_key).first():
        return
    db.add(CallNotification(
        user_id=user_id,
        event_key=event_key,
        event_type=event_type,
        title=title,
        message=message,
        call_record_id=call_record_id,
        asr_job_id=asr_job_id,
    ))
    db.flush()


def create_upload_notification(
    db: Session,
    *,
    user_id: int,
    job_id: str,
    asr_job_id: int,
    filename: str,
    event_type: str = "processing",
    title: str | None = None,
    message: str | None = None,
    call_record_id: int | None = None,
) -> CallNotification:
    event_key = f"asr:{job_id}:upload:{user_id}"
    notification = db.query(CallNotification).filter(CallNotification.event_key == event_key).first()
    if notification is None:
        safe_filename = filename.replace("\r", " ").replace("\n", " ").strip() or "Bản ghi âm"
        notification = CallNotification(
            user_id=user_id,
            event_key=event_key,
            event_type=event_type,
            title=f"{title or 'Đang xử lý'}: {safe_filename}"[:160],
            message=message or "Bản ghi đã tải lên đang được xử lý và sẽ sớm khả dụng.",
            call_record_id=call_record_id,
            asr_job_id=asr_job_id,
        )
        db.add(notification)
    else:
        notification.event_type = event_type
        notification.title = title or notification.title
        notification.message = message or notification.message
        notification.call_record_id = call_record_id
    db.flush()
    return notification


def update_upload_notifications(
    db: Session,
    *,
    asr_job_id: int,
    job_id: str,
    event_type: str,
    title: str,
    message: str,
    call_record_id: int | None,
) -> set[int]:
    notifications = (
        db.query(CallNotification)
        .filter(
            CallNotification.asr_job_id == asr_job_id,
            CallNotification.event_key.like(f"asr:{job_id}:upload:%"),
        )
        .all()
    )
    recipients = {notification.user_id for notification in notifications}
    for notification in notifications:
        if notification.event_type != event_type:
            filename = notification.title.split(": ", maxsplit=1)[-1]
            notification.event_type = event_type
            notification.title = f"{title}: {filename}"[:160]
            notification.message = message
            notification.call_record_id = call_record_id
            notification.is_read = False
    db.flush()
    return recipients
